import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-center text-primary">
            QueueFlow 🚀
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Badge variant="success" className="w-fit mx-auto">
            System Online
          </Badge>
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Landing;