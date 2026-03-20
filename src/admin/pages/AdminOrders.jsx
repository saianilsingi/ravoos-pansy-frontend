import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["placed", "packing", "shipped", "out_for_delivery", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  useEffect(() => { document.title = "Orders | Admin"; }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let url = `admin/orders/?page=${currentPage}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      setOrders(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 15));
    } catch {
      toast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`orders/${orderId}/status/`, { status: newStatus });
      toast("Status updated", "success");
      fetchOrders();
    } catch (err) {
      toast(err.response?.data?.error || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const columns = [
    {
      key: "id",
      label: "Order",
      render: (row) => <span className="font-medium text-stone-800 dark:text-stone-200">#{row.id}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => (
        <div>
          <p className="font-medium text-sm text-stone-800 dark:text-stone-200">{row.user_name}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">{row.user_email}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (row) => <span className="font-semibold">₹{row.total}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} type="order" />,
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
        <div className="flex items-center gap-2 justify-end">
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            disabled={updatingId === row.id}
            className="text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900
                       rounded-lg px-2 py-1 disabled:opacity-50 transition-colors"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button
            onClick={() => setExpandedOrder(expandedOrder === row.id ? null : row.id)}
            className="text-amber-600 dark:text-amber-400 hover:underline text-xs font-medium"
          >
            {expandedOrder === row.id ? "Hide" : "Details"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleFilterChange("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            statusFilter === ""
              ? "bg-amber-600 dark:bg-amber-500 text-white"
              : "bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-amber-600 dark:bg-amber-500 text-white"
                : "bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
        <DataTable columns={columns} data={orders} loading={loading} emptyMessage="No orders found" />

        {/* Expanded order detail */}
        {expandedOrder && orders.find((o) => o.id === expandedOrder) && (() => {
          const order = orders.find((o) => o.id === expandedOrder);
          return (
            <div className="mt-4 border border-stone-200 dark:border-stone-800 rounded-lg p-4 bg-stone-50 dark:bg-stone-800/50 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-stone-500 dark:text-stone-400">Subtotal:</span> <span className="font-medium">₹{order.subtotal}</span></div>
                <div><span className="text-stone-500 dark:text-stone-400">GST:</span> <span className="font-medium">₹{order.gst}</span></div>
                <div><span className="text-stone-500 dark:text-stone-400">Discount:</span> <span className="font-medium text-green-600 dark:text-green-400">₹{order.discount}</span></div>
                <div><span className="text-stone-500 dark:text-stone-400">Total:</span> <span className="font-bold">₹{order.total}</span></div>
              </div>

              <div className="text-sm">
                <span className="text-stone-500 dark:text-stone-400">Address: </span>
                <span className="text-stone-700 dark:text-stone-300">{order.address_text}</span>
              </div>

              {order.items?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">Items</p>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-stone-700 dark:text-stone-300">{item.product_name} x{item.quantity}</span>
                        <span className="font-medium">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
