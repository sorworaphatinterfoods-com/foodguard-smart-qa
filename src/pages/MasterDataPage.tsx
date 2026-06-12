import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockRawMaterials, mockProducts, mockEquipment, mockEmployees, mockProcesses } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCcps } from '@/hooks/useCcps';

export default function MasterDataPage() {
  const { data: suppliers = [] } = useSuppliers();
  const { data: ccps = [] } = useCcps();

  return (
    <AppLayout title="Master Data" showBack>
      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="employees" className="text-xs">Employees</TabsTrigger>
          <TabsTrigger value="suppliers" className="text-xs">Suppliers</TabsTrigger>
          <TabsTrigger value="materials" className="text-xs">Materials</TabsTrigger>
          <TabsTrigger value="more" className="text-xs">More</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">01 — Employee List</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Dept</TableHead>
                    <TableHead className="text-xs">Position</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployees.map(e => (
                    <TableRow key={e.employeeId}>
                      <TableCell className="font-mono text-xs">{e.employeeId}</TableCell>
                      <TableCell className="text-xs">{e.employeeName}</TableCell>
                      <TableCell className="text-xs">{e.department}</TableCell>
                      <TableCell className="text-xs">{e.position}</TableCell>
                      <TableCell><Badge variant={e.status === 'Active' ? 'secondary' : 'destructive'} className="text-[10px]">{e.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">02 — Supplier List ({suppliers.length})</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Material</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Last Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map(s => (
                    <TableRow key={s.supplierId}>
                      <TableCell className="font-mono text-xs">{s.supplierId}</TableCell>
                      <TableCell className="text-xs">{s.supplierName}</TableCell>
                      <TableCell className="text-xs">{s.materialType}</TableCell>
                      <TableCell>
                        <Badge variant={s.approvedStatus === 'Approved' ? 'secondary' : s.approvedStatus === 'Pending' ? 'default' : 'destructive'} className="text-[10px]">
                          {s.approvedStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.lastAuditDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card className="mb-4">
            <CardHeader className="pb-2"><CardTitle className="text-sm">03 — Raw Materials</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Storage</TableHead>
                    <TableHead className="text-xs">Allergen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRawMaterials.map(m => (
                    <TableRow key={m.materialId}>
                      <TableCell className="font-mono text-xs">{m.materialId}</TableCell>
                      <TableCell className="text-xs">{m.materialName}</TableCell>
                      <TableCell className="text-xs">{m.category}</TableCell>
                      <TableCell className="text-xs">{m.storageCondition}</TableCell>
                      <TableCell className="text-xs">{m.allergen}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">04 — Finished Goods</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Allergen</TableHead>
                    <TableHead className="text-xs">Storage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProducts.map(p => (
                    <TableRow key={p.productId}>
                      <TableCell className="font-mono text-xs">{p.productId}</TableCell>
                      <TableCell className="text-xs">{p.productName}</TableCell>
                      <TableCell className="text-xs">{p.productType}</TableCell>
                      <TableCell className="text-xs">{p.allergen}</TableCell>
                      <TableCell className="text-xs">{p.storage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="more">
          <Card className="mb-4">
            <CardHeader className="pb-2"><CardTitle className="text-sm">05 — Equipment</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Process</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">QR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEquipment.map(e => (
                    <TableRow key={e.equipmentId}>
                      <TableCell className="font-mono text-xs">{e.equipmentId}</TableCell>
                      <TableCell className="text-xs">{e.equipmentName}</TableCell>
                      <TableCell className="text-xs">{e.process}</TableCell>
                      <TableCell className="text-xs">{e.location}</TableCell>
                      <TableCell className="font-mono text-xs">{e.qrCode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="mb-4">
            <CardHeader className="pb-2"><CardTitle className="text-sm">06 — Processes</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Area</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProcesses.map(p => (
                    <TableRow key={p.processId}>
                      <TableCell className="font-mono text-xs">{p.processId}</TableCell>
                      <TableCell className="text-xs">{p.processName}</TableCell>
                      <TableCell className="text-xs">{p.area}</TableCell>
                      <TableCell><Badge variant={p.type === 'CCP' ? 'destructive' : 'secondary'} className="text-[10px]">{p.type}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">12 — CCP Master / Plan ({ccps.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-3">
              {ccps.map((ccp) => (
                <div key={ccp.id} className="bg-muted p-3 rounded text-xs">
                  <p className="font-semibold">
                    <span className="font-mono text-muted-foreground mr-1">{ccp.id}</span>
                    {ccp.process} — {ccp.ccpName}
                  </p>
                  <p><span className="text-muted-foreground">Critical Limit:</span> <span className="font-mono font-bold text-[hsl(var(--status-fail))]">{ccp.criticalLimit}</span></p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
