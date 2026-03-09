import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, ArrowDown } from 'lucide-react';
import { mockTraceData } from '@/lib/mock-data';

const nodeIcons: Record<string, string> = {
  supplier: '🏭',
  raw_material: '📦',
  batch: '⚙️',
  finished_good: '🏷️',
  shipment: '🚛',
  customer: '🏪',
};

const nodeColors: Record<string, string> = {
  supplier: 'border-l-[hsl(var(--status-info))]',
  raw_material: 'border-l-[hsl(var(--status-warning))]',
  batch: 'border-l-[hsl(var(--primary))]',
  finished_good: 'border-l-[hsl(var(--status-pass))]',
  shipment: 'border-l-[hsl(var(--accent))]',
  customer: 'border-l-[hsl(var(--ring))]',
};

export default function TraceabilityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [traceResult, setTraceResult] = useState<typeof mockTraceData | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would query backend. Mock: show full chain.
    setTraceResult(mockTraceData);
  };

  return (
    <AppLayout title="Traceability" showBack>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🔍 Trace Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <Label>Search Type</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lot">Lot Number</SelectItem>
                  <SelectItem value="batch">Batch ID</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter lot number, batch ID, or keyword..."
                className="font-mono flex-1"
              />
              <Button type="submit" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {traceResult && (
        <div className="space-y-1">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Trace Chain — Forward & Backward
          </h3>
          {traceResult.nodes.map((node, idx) => (
            <div key={node.id}>
              <Card className={`border-l-4 ${nodeColors[node.type]}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{nodeIcons[node.type]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {node.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">{node.date}</span>
                      </div>
                      <p className="font-semibold text-sm">{node.label}</p>
                      <p className="text-xs text-muted-foreground">{node.details}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {idx < traceResult.nodes.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!traceResult && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Enter a lot number, batch ID, or supplier name to trace the full chain from supplier to customer.
            </p>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
