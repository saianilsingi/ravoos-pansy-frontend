import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import StatCard from "../components/StatCard";
import GrowthCard from "../components/GrowthCard";
import RevenueChart from "../components/RevenueChart";
import StatusBar from "../components/StatusBar";

const fmt = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-2 animate-pulse">
      <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
      <div className="h-7 bg-stone-200 dark:bg-stone-700 rounded w-2/3" />
    </div>
  );
}

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [ordersByStatus, setOrdersByStatus] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [wishlistStats, setWishlistStats] = useState(null);
  const [couponStats, setCouponStats] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    document.title = "Admin Overview | Ravoos Pansy";
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get("admin/analytics/overview/"),
      api.get("admin/analytics/revenue-chart/?days=30"),
      api.get("admin/analytics/orders-by-status/"),
      api.get("admin/analytics/top-products/"),
      api.get("admin/analytics/wishlist-stats/"),
      api.get("admin/analytics/coupons/"),
    ])
      .then(([ov, rc, os, tp, ws, cs]) => {
        if (cancelled) return;
        setOverview(ov.data);
        setRevenueChart(rc.data);
        setOrdersByStatus(os.data);
        setTopProducts(tp.data);
        setWishlistStats(ws.data);
        setCouponStats(cs.data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load analytics");
          toast("Failed to load analytics", "error");
        }
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-stone-500 dark:text-stone-400">{error}</p>
      </div>
    );
  }

  const loading = !overview;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* STAT CARDS */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={fmt(overview.total_revenue)} color="text-green-600 dark:text-green-400" />
            <StatCard label="Revenue Today" value={fmt(overview.revenue_today)} color="text-green-600 dark:text-green-400" />
            <StatCard label="Total Orders" value={overview.total_orders} />
            <StatCard label="Orders Today" value={overview.orders_today} />
            <StatCard label="Paid Orders" value={overview.total_paid_orders} />
            <StatCard label="Avg Order Value" value={fmt(overview.average_order_value)} color="text-amber-600 dark:text-amber-400" />
            <StatCard label="Total Users" value={overview.total_users} />
            <StatCard label="Total Products" value={overview.total_products} />
            <StatCard
              label="Low Stock"
              value={overview.low_stock_products}
              color={overview.low_stock_products > 0 ? "text-red-500 dark:text-red-400" : undefined}
            />
          </div>

          {/* GROWTH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <GrowthCard label="Revenue Growth (30d)" current={overview.revenue_last_30_days} previous={overview.revenue_previous_30_days} growth={overview.revenue_growth_percentage} prefix="₹" />
            <GrowthCard label="Orders Growth (30d)" current={overview.orders_last_30_days} previous={overview.orders_previous_30_days} growth={overview.orders_growth_percentage} />
            <StatCard label="Avg Order Value" value={fmt(overview.average_order_value)} color="text-amber-600 dark:text-amber-400" sub={`${overview.total_paid_orders} paid orders`} />
          </div>
        </>
      )}

      {/* REVENUE CHART */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-4">Revenue (Last 30 Days)</h3>
        {!revenueChart ? (
          <div className="h-64 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
        ) : revenueChart.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-stone-400 dark:text-stone-500">No revenue data yet</div>
        ) : (
          <div className="h-64"><RevenueChart data={revenueChart} /></div>
        )}
      </div>

      {/* STATUS + TOP PRODUCTS */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          {!ordersByStatus ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
                  <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded" />
                </div>
              ))}
            </div>
          ) : ordersByStatus.length === 0 ? (
            <p className="text-stone-400 dark:text-stone-500 text-sm">No orders yet</p>
          ) : (
            <StatusBar data={ordersByStatus} />
          )}
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          {!topProducts ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-stone-200 dark:bg-stone-700 rounded" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-stone-400 dark:text-stone-500 text-sm">No sales data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium text-right">Qty Sold</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {topProducts.map((p) => (
                    <tr key={p.product_id}>
                      <td className="py-2.5 font-medium text-stone-800 dark:text-stone-200 truncate max-w-[200px]">{p.name}</td>
                      <td className="py-2.5 text-right text-stone-600 dark:text-stone-400">{p.total_quantity_sold}</td>
                      <td className="py-2.5 text-right font-medium text-amber-600 dark:text-amber-400">{fmt(p.revenue_generated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* COUPON ANALYTICS */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-4">Coupon Analytics</h3>
        {!couponStats ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-1/4" />
            <div className="h-40 bg-stone-200 dark:bg-stone-700 rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-6 flex-wrap text-sm">
              <div>
                <span className="text-stone-500 dark:text-stone-400">Total coupons: </span>
                <span className="font-semibold">{couponStats.total_coupons}</span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400">Active: </span>
                <span className="font-semibold text-green-600 dark:text-green-400">{couponStats.active_coupons}</span>
              </div>
            </div>

            {couponStats.top_performing_coupons.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Top Performing Coupon</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{couponStats.top_performing_coupons[0].coupon_code}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">{fmt(couponStats.top_performing_coupons[0].revenue_generated)} revenue generated</p>
              </div>
            )}

            {couponStats.coupon_usage_summary.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                      <th className="pb-2 font-medium">Code</th>
                      <th className="pb-2 font-medium text-right">Uses</th>
                      <th className="pb-2 font-medium text-right">Discount Given</th>
                      <th className="pb-2 font-medium text-right">Revenue</th>
                      <th className="pb-2 font-medium text-right">AOV</th>
                      <th className="pb-2 font-medium text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {couponStats.coupon_usage_summary.map((c) => (
                      <tr key={c.coupon_id}>
                        <td className="py-2.5 font-mono font-semibold text-stone-800 dark:text-stone-200">{c.coupon_code}</td>
                        <td className="py-2.5 text-right text-stone-600 dark:text-stone-400">{c.times_used}</td>
                        <td className="py-2.5 text-right text-red-500 dark:text-red-400">{fmt(c.total_discount_given)}</td>
                        <td className="py-2.5 text-right font-medium text-green-600 dark:text-green-400">{fmt(c.revenue_generated)}</td>
                        <td className="py-2.5 text-right text-stone-600 dark:text-stone-400">{fmt(c.average_order_value)}</td>
                        <td className="py-2.5 text-right text-stone-600 dark:text-stone-400">{c.percentage_of_total_revenue.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-stone-400 dark:text-stone-500 text-sm">No coupon usage data yet</p>
            )}

            {couponStats.unused_coupons.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2">Unused Coupons</h4>
                <div className="flex gap-2 flex-wrap">
                  {couponStats.unused_coupons.map((c) => (
                    <span key={c.coupon_id} className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full text-xs font-mono">
                      {c.coupon_code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WISHLIST STATS */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-4">Wishlist Stats</h3>
        {!wishlistStats ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-1/4" />
            <div className="h-10 bg-stone-200 dark:bg-stone-700 rounded" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Total wishlist items: <span className="font-semibold text-stone-900 dark:text-stone-100">{wishlistStats.total_wishlist_items}</span>
            </p>
            {wishlistStats.most_wishlisted_products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium text-right">Wishlisted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {wishlistStats.most_wishlisted_products.map((p) => (
                      <tr key={p.product_id}>
                        <td className="py-2.5 font-medium text-stone-800 dark:text-stone-200 truncate max-w-[300px]">{p.name}</td>
                        <td className="py-2.5 text-right text-red-500 dark:text-red-400 font-medium">{p.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-stone-400 dark:text-stone-500 text-sm">No wishlist data yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
