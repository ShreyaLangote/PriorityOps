import { useState } from "react";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const UserPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketInfo, setTicketInfo] = useState({ ticketId: '', estimatedResponse: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.submitTicket(formData);
      setTicketInfo(response);
      setSubmitted(true);
      
      toast({
        title: "Ticket Submitted Successfully",
        description: `Your ticket ${response.ticketId} has been created.`,
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen grid-pattern flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-card border border-success/30 rounded-lg p-8 glow-cyan animate-scale-in">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-success/20 border border-success/30">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-display font-bold text-success mb-2">
                Ticket Submitted!
              </h2>
              <p className="text-muted-foreground">
                Your IT request has been logged successfully
              </p>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ticket ID:</span>
                <span className="text-xl font-display font-bold text-primary">{ticketInfo.ticketId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estimated Response:</span>
                <span className="text-lg font-medium text-accent">{ticketInfo.estimatedResponse}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', department: '', title: '', description: '' });
                }}
                className="flex-1 bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary"
              >
                Submit Another Ticket
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
              >
                Return to Portal
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-pattern">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-5xl font-display font-bold text-accent mb-2 text-glow-blue">
              PRIORITYOPS
            </h1>
            <p className="text-2xl font-display font-semibold mb-1">Support Portal</p>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">
              Submit Your IT Request
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-primary/30 rounded-lg p-8 space-y-6 glow-blue">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border-primary/30"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select 
              required
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger className="bg-background border-primary/30">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-background border-primary/30"
              placeholder="Brief description of your issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-primary/30 min-h-[120px]"
              placeholder="Please provide as much detail as possible about your IT issue..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attach File (Optional)</Label>
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <p className="text-sm">Click to upload or drag and drop</p>
                <p className="text-xs">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-lg py-6 glow-blue hover:scale-105 transition-all"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserPortal;
