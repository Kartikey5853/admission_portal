import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSidebar from '@/components/AdminSidebar';
import api from '@/services/api'; // 1. Use our Axios instance
import { useToast } from '@/hooks/use-toast'; // Assuming you have toasts

// Define the interface for the data coming from the backend
interface StudentApplication {
  id: number;
  student_id: number;
  branch: string | null;
  submission_date: string; // Comes as ISO string
  status: string; // e.g., 'Pending', 'Approved'
  studentName: string;
  studentEmail: string;
}

// Interface for the paginated response
interface PaginatedResponse {
  total: number;
  page: number;
  size: number;
  items: StudentApplication[];
}

const Students = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10; // Or fetch from backend/config

  // 2. useEffect to fetch data from the backend
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<PaginatedResponse>('/admin/students', {
          params: {
            page: page,
            size: pageSize,
            search: searchTerm || undefined, // Send undefined if empty
            status: statusFilter === 'all' ? undefined : statusFilter, // Send undefined if 'all'
          },
        });
        setApplications(response.data.items);
        setTotalItems(response.data.total);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        toast({
          title: "Error",
          description: "Could not load student applications.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce: Wait 300ms after user stops typing to fetch
    const debounceFetch = setTimeout(() => {
        fetchApplications();
    }, 300);

    return () => clearTimeout(debounceFetch); // Clear timeout on cleanup

  }, [searchTerm, statusFilter, page, toast, pageSize]); // Re-fetch when these change

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page on new filter
  };

  const handlePageChange = (newPage: number) => {
     if (newPage >= 1 && newPage <= totalPages) {
         setPage(newPage);
     }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Verified':
          return <Badge className="bg-blue-600 hover:bg-blue-700">Verified</Badge>;
      default: // Pending or other statuses
        return <Badge variant="secondary">{status || 'Pending'}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-accent/30">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Management</h1>
          <p className="text-muted-foreground">Review and verify student applications</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Applications ({totalItems})</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or application ID..."
                  value={searchTerm}
                  onChange={handleSearchChange} // Use updated handler
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}> {/* Use updated handler */}
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No applications found</TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>{app.studentName}</TableCell>
                      <TableCell>{app.branch || 'N/A'}</TableCell>
                      <TableCell>{new Date(app.submission_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/admin/students/${app.student_id}`}> {/* Link uses student_id */}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View & Verify
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
             <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({totalItems} items)
                </span>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Students;