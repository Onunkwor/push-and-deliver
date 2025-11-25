// src/router/Router.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Layout } from "@/components/layout";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import UserDetailsPage from "@/pages/users/details";
import RidersPage from "@/pages/riders";
import RiderDetailsPage from "@/pages/riders/details";
import VendorsPage from "@/pages/vendors";
import VendorDetailsPage from "@/pages/vendors/details";
import FeesPage from "@/pages/fees";
import ReferralsPage from "@/pages/referrals";
import WithdrawalsPage from "@/pages/withdrawals";
import CouponsPage from "@/pages/coupons";
import SettingsPage from "@/pages/settings";
import HelpPage from "@/pages/help";
import SupportTicketsPage from "@/pages/support-tickets";
import RestaurantOrdersPage from "@/pages/restaurant-orders";
import RestaurantOrderDetailsPage from "@/pages/restaurant-orders/details";
import ShipmentOrdersPage from "@/pages/shipment-orders";
import ShipmentOrderDetailsPage from "@/pages/shipment-orders/details";
import RideHailingPage from "@/pages/ride-hailing";
import RideHailingDetailsPage from "@/pages/ride-hailing/details";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/sign-in/*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <SignIn routing="path" path="/sign-in" />
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
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
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
