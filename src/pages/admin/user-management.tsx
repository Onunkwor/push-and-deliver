import { useState, useEffect } from "react";
import { usersService } from "@/services/users.service";
import type { User } from "@/types";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconTrash,
  IconSearch,
  IconUserCircle,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserManagementPage() {
  const { user: currentUser, isAdmin, loading: authLoading } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, value: string) => {
    try {
      let updates: Partial<User> = {};
      if (value === "user") {
        updates = { isAdmin: false, adminType: undefined };
      } else {
        updates = {
          isAdmin: true,
          adminType: value as "super" | "regular" | "customercare",
        };
      }

      await usersService.updateUser(userId, updates);

      setUsers(users.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
      toast.success("User role updated");
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await usersService.deleteUser(userToDelete);
      setUsers(users.filter((u) => u.id !== userToDelete));
      toast.success("User deleted successfully");
      setUserToDelete(null);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  if (authLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Access check: Must be authenticated and a super admin
  if (!currentUser || currentUser.adminType !== "super") {
    // If not super admin, redirect to dashboard (auth handled by wrapper usually, but this is double check)
    // Actually, protected routes only checks isAdmin. Regular admins might reach here if they guess URL.
    return <Navigate to="/dashboard" replace />;
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage admin access and users</p>
      </div>

      <div className="flex items-center gap-2">
        <IconSearch className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="space-y-4">
        <div className="border rounded-md bg-white dark:bg-zinc-950">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-12">User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-6 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user?.imageURL ? (
                          <img
                            src={user.imageURL}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <IconUserCircle className="size-8 text-neutral-300" />
                        )}
                        <span>{user.username || "No Name"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge
                          variant={
                            user.adminType === "super" ? "default" : "secondary"
                          }
                        >
                          {user.adminType?.toUpperCase() || "ADMIN"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          User
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={user.isAdmin ? user.adminType : "user"}
                          onValueChange={(val) => updateUserRole(user.id!, val)}
                          disabled={user.id === currentUser.id} // Prevent changing own role potentially
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              User (No Admin Access)
                            </SelectItem>
                            <SelectItem value="super">Super Admin</SelectItem>
                            <SelectItem value="regular">
                              Regular Admin
                            </SelectItem>
                            <SelectItem value="customercare">
                              Customer Care
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* <Dialog
                          open={userToDelete === user.id}
                          onOpenChange={(open) =>
                            !open && setUserToDelete(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setUserToDelete(user.id!)}
                              disabled={user.id === currentUser.id}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete User?</DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete the user account for{" "}
                                <strong>{user.email}</strong>.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setUserToDelete(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteUser}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-muted-foreground">
              Rows per page
            </p>
            <Select
              value={`${rowsPerPage}`}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={rowsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
              Page {currentPage} of {Math.max(totalPages, 1)}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
