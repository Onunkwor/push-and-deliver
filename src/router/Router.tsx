import UserManagementPage from "@/pages/admin/user-management";
import { Layout } from "@/components/layout";
import CouponsPage from "@/pages/coupons";
import DashboardPage from "@/pages/dashboard";
import FeesPage from "@/pages/fees";
import ReferralsPage from "@/pages/referrals";
import RestaurantOrdersPage from "@/pages/restaurant-orders";
import RestaurantOrderDetailsPage from "@/pages/restaurant-orders/details";
import RideHailingPage from "@/pages/ride-hailing";
import RideHailingDetailsPage from "@/pages/ride-hailing/details";
import RidersPage from "@/pages/riders";
import RiderDetailsPage from "@/pages/riders/details";
import ShipmentOrdersPage from "@/pages/shipment-orders";
import ShipmentOrderDetailsPage from "@/pages/shipment-orders/details";
import SupportTicketsPage from "@/pages/support-tickets";
import UsersPage from "@/pages/users";
import UserDetailsPage from "@/pages/users/details";
import VendorsPage from "@/pages/vendors";
import VendorDetailsPage from "@/pages/vendors/details";
import WithdrawalsPage from "@/pages/withdrawals";
import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/sign-in/*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <SignIn
                routing="path"
                path="/sign-in"
                fallbackRedirectUrl="/dashboard"
              />
            </div>
          }
        />

        <Route
          path="/*"
          element={
            <>
              <SignedIn>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route
                      path="/admin/users"
                      element={<UserManagementPage />}
                    />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/users/:id" element={<UserDetailsPage />} />
                    <Route path="/riders" element={<RidersPage />} />
                    <Route path="/riders/:id" element={<RiderDetailsPage />} />
                    <Route path="/vendors" element={<VendorsPage />} />
                    <Route
                      path="/vendors/:id"
                      element={<VendorDetailsPage />}
                    />
                    <Route path="/fees" element={<FeesPage />} />
                    <Route path="/referrals" element={<ReferralsPage />} />
                    <Route path="/withdrawals" element={<WithdrawalsPage />} />
                    <Route path="/coupons" element={<CouponsPage />} />
                    <Route
                      path="/support-tickets"
                      element={<SupportTicketsPage />}
                    />
                    <Route
                      path="/restaurant-orders"
                      element={<RestaurantOrdersPage />}
                    />
                    <Route
                      path="/restaurant-orders/:id"
                      element={<RestaurantOrderDetailsPage />}
                    />
                    <Route
                      path="/shipment-orders"
                      element={<ShipmentOrdersPage />}
                    />
                    <Route
                      path="/shipment-orders/:id"
                      element={<ShipmentOrderDetailsPage />}
                    />
                    <Route path="/ride-hailing" element={<RideHailingPage />} />
                    <Route
                      path="/ride-hailing/:id"
                      element={<RideHailingDetailsPage />}
                    />
                  </Routes>
                </Layout>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
