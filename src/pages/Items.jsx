import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


// ----------------------------
// Category-based fallback images
// ----------------------------
const CATEGORY_FALLBACK_IMAGES = {
  food: "https://source.unsplash.com/400x300/?food",
  drinks: "https://source.unsplash.com/400x300/?drink",
  clothes: "https://source.unsplash.com/400x300/?fashion",
  gaming: "https://source.unsplash.com/400x300/?gaming",
  default: "https://dummyimage.com/400x300/e0e0e0/555&text=No+Image",
};

export default function Items() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ----------------------------
  // Add to cart
  // ----------------------------
  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      alert("Admins cannot purchase products");
      return;
    }

    try {
      await api.post("cart/add/", {
        product_id: productId,
        quantity: 1,
      });
      alert("Added to cart");
    } catch (err) {
      alert("Failed to add to cart");
    }
  };

  // ----------------------------
  // Theme switching
  // ----------------------------
  useEffect(() => {
    if (activeCategory === "food") {
      document.body.style.background = "#fff3e0";
    } else if (activeCategory === "drinks") {
      document.body.style.background = "#e3f2fd";
    } else if (activeCategory === "clothes") {
      document.body.style.background = "#fce4ec";
    } else if (activeCategory === "gaming") {
      document.body.style.background = "#121212";
    } else {
      document.body.style.background = "#ffffff";
    }
  }, [activeCategory]);

  // ----------------------------
  // Fetch categories
  // ----------------------------
  useEffect(() => {
    api.get("categories/")
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  // ----------------------------
  // Fetch products
  // ----------------------------
  useEffect(() => {
    setLoading(true);

    let url = "products/";
    const params = [];

    if (activeCategory) params.push(`category=${activeCategory}`);
    if (search) params.push(`search=${search}`);

    if (params.length) {
      url += "?" + params.join("&");
    }

    api.get(url)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <div>
      <h2>Items</h2>

      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "10px" }}
      />

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveCategory("")}>All</button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            style={{
              marginLeft: "8px",
              fontWeight: activeCategory === cat.slug ? "bold" : "normal"
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px"
          }}
        >
          {products.map(product => {
  const imageSrc =
    product.image ||
    CATEGORY_FALLBACK_IMAGES[product.category.slug] ||
    CATEGORY_FALLBACK_IMAGES.default;

  return (
    <div
      key={product.id}
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "10px",
        background: "#fff",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* -------- IMAGE -------- */}
      <img
        src={imageSrc}
        alt={product.name}
        style={{
          width: "100%",
          height: "160px",
          objectFit: "cover",
          borderRadius: "8px",
          marginBottom: "8px",
          background: "#f5f5f5",
        }}
        onError={(e) => {
          e.target.src = CATEGORY_FALLBACK_IMAGES.default;
        }}
      />

      {/* -------- INFO -------- */}
      <h4 style={{ margin: "6px 0" }}>{product.name}</h4>

      <p style={{ fontWeight: "bold", margin: "4px 0" }}>
        ₹{product.price}
      </p>

      <p style={{ fontSize: "12px", color: "#777" }}>
        {product.category.name}
      </p>

      <button
        onClick={() => handleAddToCart(product.id)}
        style={{
          marginTop: "8px",
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "none",
          background: "#1976d2",
          color: "white",
          cursor: "pointer",
        }}
      >
        Add to Cart
      </button>
    </div>
  );
})}


        </div>
      )}
    </div>
  );
}
