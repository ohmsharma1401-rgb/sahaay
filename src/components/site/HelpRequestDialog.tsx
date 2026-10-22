import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";
import type { NgoRow } from "@/lib/ngos";
import { pushNotification } from "@/lib/notifications";

export const ISSUE_TYPES = [
  "Family Dispute",
  "Women's Rights",
  "Domestic Violence",
  "Child Protection",
  "Property Dispute",
  "Cyber Crime",
  "Senior Citizen",
  "Marriage Problems",
  "Mental Health",
  "Other",
] as const;

export const URGENCY_LEVELS = ["low", "normal", "high", "emergency"] as const;

export function HelpRequestDialog({
  ngo,
  open,
  onOpenChange,
}: {
  ngo: NgoRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    title: "",
    subject: "",
    issue_type: "Other",
    urgency: "normal",
    location: "",
    message: "",
    attachment_url: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ngo) return;
    if (!user) {
      toast.error("Please sign in to send a help request.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("help_requests").insert({
      ngo_id: ngo.id,
      citizen_id: user.id,
      name: form.name,
      phone: form.phone,
      subject: form.subject || form.title,
      title: form.title || form.subject,
      issue_type: form.issue_type,
      urgency: form.urgency,
      location: form.location || null,
      message: form.message,
      attachment_url: form.attachment_url || null,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (ngo.owner_id) {
      await pushNotification({
        user_id: ngo.owner_id,
        title: "New help request",
        body: `${form.name}: ${form.title || form.subject}`,
        kind: "help_request",
        link: "/dashboard/ngo",
      });
    }
    toast.success("Help request sent");
    onOpenChange(false);
    setForm({ name: "", phone: "", title: "", subject: "", issue_type: "Other", urgency: "normal", location: "", message: "", attachment_url: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send help request</DialogTitle>
          <DialogDescription>
            {ngo ? `Reach out to ${ngo.name} for assistance.` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="h-name">Your name</Label>
              <Input id="h-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="h-phone">Phone</Label>
              <Input id="h-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="h-title">Issue title</Label>
            <Input id="h-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, subject: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Issue type</Label>
              <Select value={form.issue_type} onValueChange={(v) => setForm({ ...form, issue_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Urgency</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="h-loc">Location</Label>
            <Input id="h-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City or area" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="h-msg">Describe your situation</Label>
            <Textarea id="h-msg" required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="h-att">Attachment URL (optional)</Label>
            <Input id="h-att" value={form.attachment_url} onChange={(e) => setForm({ ...form, attachment_url: e.target.value })} placeholder="Link to a document or image" />
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send request"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
