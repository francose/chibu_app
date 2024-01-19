// pages/index.js

export default function Home() {
  return (
    <div
      className="relative text-center py-12 min-h-screen flex flex-col justify-center items-center"
      style={{
        backgroundImage: 'url("/images/banners/sky.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-300 to-indigo-900 opacity-75"></div>

      {/* Ensure the content is positioned above the overlay */}
      <div className="relative z-10">
        <h1 style={{ margin: "20px 0",color:"#111", fontSize: "24px", fontWeight: "bold" }}>
          Chibu.io
        </h1>
        <p style={{ margin: "20px 0", fontSize: "24px", fontWeight: "bold" }}>
          We deliver the best
        </p>
        <p>
          Chibu.io lets your hosted apps run in the most efficient and secure
          way.
        </p>
        <button
          style={{
            marginTop: "30px",
            padding: "10px 30px",
            fontSize: "18px",
            backgroundColor: "#111",
            color: "white",
            border: "none",
            borderRadius: "25px",
            cursor: "pointer",
          }}
        >
          GET STARTED
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
          }}
        >
       
        </div>
      </div>
    </div>
  );
}
