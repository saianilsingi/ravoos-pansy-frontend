import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import StarRating from "../../components/StarRating";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  useEffect(() => { document.title = "Reviews | Admin"; }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`admin/reviews/?page=${currentPage}`);
      setReviews(res.data.results || res.data);
      if (res.data.count) {
        setTotalPages(Math.ceil(res.data.count / 10));
      }
    } catch {
      toast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, toast]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`admin/reviews/${deleteTarget}/delete/`);
      toast("Review deleted", "success");
      setDeleteTarget(null);
      fetchReviews();
    } catch {
      toast("Failed to delete review", "error");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const columns = [
    {
      key: "user_name",
      label: "User",
      render: (row) => <span className="font-medium text-stone-800 dark:text-stone-200">{row.user_name}</span>,
    },
    {
      key: "product_name",
      label: "Product",
      render: (row) => <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">{row.product_name}</span>,
    },
    {
      key: "rating",
      label: "Rating",
      render: (row) => <StarRating rating={row.rating} size="text-xs" />,
    },
    {
      key: "comment",
      label: "Comment",
      render: (row) => (
        <span className="text-stone-600 dark:text-stone-400 text-xs truncate block max-w-[250px]">
          {row.comment || "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (row) => <span className="text-stone-500 dark:text-stone-400 text-xs">{formatDate(row.created_at)}</span>,
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (row) => (
        <button onClick={() => setDeleteTarget(row.id)} className="text-red-500 dark:text-red-400 hover:underline text-xs">
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl">
      <p className="text-sm text-stone-500 dark:text-stone-400">Manage all product reviews</p>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
        <DataTable columns={columns} data={reviews} loading={loading} emptyMessage="No reviews yet" />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? The product's average rating will be recalculated."
      />
    </div>
  );
}
