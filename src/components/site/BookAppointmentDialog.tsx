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
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";
import type { NgoRow } from "@/lib/ngos";

export function BookAppointmentDialog({
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
    email: "",
    preferred_date: "",
    preferred_time: "",
    message: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ngo) return;
    if (!user) {
      toast.error("Please sign in to book an appointment.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      ngo_id: ngo.id,
      citizen_id: user.id,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
      message: form.message || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Appointment request sent");
    onOpenChange(false);
    setForm({ name: "", phone: "", email: "", preferred_date: "", preferred_time: "", message: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book appointment</DialogTitle>
          <DialogDescription>
            {ngo ? `Request an appointment with ${ngo.name}.` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="a-name">Your name</Label>
            <Input id="a-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="a-phone">Phone</Label>
              <Input id="a-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="a-email">Email</Label>
              <Input id="a-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="a-date">Preferred date</Label>
              <Input id="a-date" type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="a-time">Preferred time</Label>
              <Input id="a-time" type="time" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="a-msg">Message</Label>
            <Textarea id="a-msg" rows={3} placeholder="Briefly describe how we can help" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
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
