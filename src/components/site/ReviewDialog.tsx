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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";
import { StarRating } from "./StarRating";

export function ReviewDialog({
  target,
  targetName,
  open,
  onOpenChange,
  onSubmitted,
}: {
  target: { kind: "ngo" | "lawyer"; id: string } | null;
  targetName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmitted?: () => void;
}) {
  const { user } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    if (!user) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    setLoading(true);
    const targetCol = target.kind === "ngo" ? "ngo_id" : "lawyer_id";

    const { data: existing, error: fetchErr } = await supabase
      .from("reviews")
      .select("id")
      .eq("citizen_id", user.id)
      .eq(targetCol, target.id)
      .maybeSingle();

    if (fetchErr) {
      setLoading(false);
      return toast.error(fetchErr.message);
    }

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("reviews")
        .update({ rating, comment: comment || null })
        .eq("id", existing.id));
    } else {
      const payload: {
        citizen_id: string;
        rating: number;
        comment: string | null;
        ngo_id?: string;
        lawyer_id?: string;
      } = { citizen_id: user.id, rating, comment: comment || null };
      if (target.kind === "ngo") payload.ngo_id = target.id;
      else payload.lawyer_id = target.id;
      ({ error } = await supabase.from("reviews").insert(payload));
    }

    setLoading(false);
    if (error) return toast.error(error.message);

    toast.success("Review submitted");
    onOpenChange(false);
    setComment("");
    setRating(5);
    onSubmitted?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
          <DialogDescription>Share your experience with {targetName}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Rating</Label>
            <StarRating value={rating} size={28} onChange={setRating} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="r-comment">Comment</Label>
            <Textarea id="r-comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was your experience?" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit review"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
