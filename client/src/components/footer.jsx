import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Footer() {
  return (
    <Card className="w-full mt-2 p-1">
      <CardContent>
        <footer className="w-full text-center text-xs text-muted-foreground">
          <p>
            {/* © {new Date().getFullYear()}{" "} */}
            <span className="font-semibold">MAA TARA TRADERS</span>. Created &
            Maintained by{" "}
            <span className="text-primary font-medium">Debmalya Maity (8084123436)</span>.
          </p>
        </footer>
      </CardContent>
    </Card>
  );
}
