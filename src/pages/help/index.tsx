// Help page
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Get help with using the admin dashboard</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Support resources coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
