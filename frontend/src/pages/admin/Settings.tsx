import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    admission_open: true,
    application_deadline: '',
    notification_banner: ''
  });

  useEffect(() => {
    fetch('/data/settings.json')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error loading settings:', err));
  }, []);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      
      <main className="flex-1 p-8 bg-accent/30">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-muted-foreground">Configure admission portal settings</p>
        </div>

        <div className="max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admission Configuration</CardTitle>
              <CardDescription>Control the admission process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="admission-status">Admission Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {settings.admission_open ? 'Admissions are currently open' : 'Admissions are currently closed'}
                  </p>
                </div>
                <Switch
                  id="admission-status"
                  checked={settings.admission_open}
                  onCheckedChange={(checked) => setSettings({ ...settings, admission_open: checked })}
                />
              </div>

              <div>
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={settings.application_deadline}
                  onChange={(e) => setSettings({ ...settings, application_deadline: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Banner</CardTitle>
              <CardDescription>Set a site-wide announcement message</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="banner">Banner Message</Label>
                <Textarea
                  id="banner"
                  value={settings.notification_banner}
                  onChange={(e) => setSettings({ ...settings, notification_banner: e.target.value })}
                  placeholder="Enter announcement message..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This message will be displayed on the landing page
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
