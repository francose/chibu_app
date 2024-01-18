terraform {
    required_providers {
      aws = {
        source= "hashicorp/aws"
        version = "4.45.0"
      }
    }
}

variable "access_key" {}
variable "secret_key" {}
variable "region" {}


provider "aws" {
  region  = "${var.region}"
  access_key = "${var.access_key}"
  secret_key =  "${var.secret_key}"
}


resource "aws_ecr_repository" "ecr_chibu_app_repo" {
  name = "chibu-app-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecs_cluster" "target_cluster" {
    name ="chibu-app-target"
}


data "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecution"
}

resource "aws_ecs_task_definition" "chibu-app-task" {
  family                   = "chibu-app-task_first" #
  container_definitions    = <<DEFINITION
  [
    {
      "name": "chibu-app-task_first",
      "image": "${aws_ecr_repository.ecr_chibu_app_repo.repository_url}",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "memory": 512,
      "cpu": 256
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] 
  network_mode             = "awsvpc"   
  memory                   = 512         
  cpu                      = 256         
  execution_role_arn       = "${data.aws_iam_role.ecs_task_execution_role.arn}"
}


resource "aws_iam_role" "ecsTaskExecutionRole" {
  name  = "ecsTaskExecutionRole"
  assume_role_policy = "${data.aws_iam_policy_document.assume_role_policy.json}"
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = "${aws_iam_role.ecsTaskExecutionRole.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


resource "aws_default_vpc" "default_vpc" {

}


resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "us-east-1a"
}

resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "us-east-1b"
}

resource "aws_security_group" "load_balancer_security_group" {
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow traffic in from all sources
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_alb" "application_load_balancer" {
  name               = "load-balancer-dev"
  load_balancer_type = "application"
  subnets = [ 
    "${aws_default_subnet.default_subnet_a.id}",
    "${aws_default_subnet.default_subnet_b.id}"
  ]

  security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
}


resource "aws_lb_target_group" "target_group" {
  name        = "target-group"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = "${aws_default_vpc.default_vpc.id}" # default VPC heree....
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = "${aws_alb.application_load_balancer.arn}" #  load balancer heeerea.....
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.target_group.arn}" # target group heree....
  }
}

resource "aws_security_group" "service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_service" "app_service" {
  name            = "app-first-service"     # Name the service - look up these values in the AWS console
  cluster         = "${aws_ecs_cluster.target_cluster.id}"   # Reference the created Cluster !!!!!! side notes....
  task_definition = "${aws_ecs_task_definition.chibu-app-task.arn}" # Reference the task that the service will spin up
  launch_type     = "FARGATE"
  desired_count   = 3 

  load_balancer {
    target_group_arn = "${aws_lb_target_group.target_group.arn}" # Reference the target group that the service will attach to llook up these values in the AWS console......
    container_name   = "${aws_ecs_task_definition.chibu-app-task.family}"
    container_port   = 3000 
  }

  network_configuration {
    subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}"]
    assign_public_ip = true     
    security_groups  = ["${aws_security_group.service_security_group.id}"] 
  }
}


output "app_url" {
  value = aws_alb.application_load_balancer.dns_name
}