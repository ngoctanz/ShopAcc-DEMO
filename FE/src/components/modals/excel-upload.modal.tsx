'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, FileUp, Loader2, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { accountService } from '@/services/account.service';
import { packageService } from '@/services/account-package.service';

interface ExcelUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'CLONE' | 'RANDOM' | 'LIST';
}

export default function ExcelUploadModal({
  open,
  onOpenChange,
  mode = 'CLONE',
}: ExcelUploadModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [parsedAccounts, setParsedAccounts] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  
  // Clone mode: select existing account or create new
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [createNewAccount, setCreateNewAccount] = useState(true);
  const [newAccountPrice, setNewAccountPrice] = useState<number>(0);
  const [newAccountInfo, setNewAccountInfo] = useState<string>('');

  // Fetch Packages
  const { data: allPackages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageService.getAllPackages(),
    staleTime: 60 * 1000,
  });

  // Fetch existing clone accounts for selected package
  const { data: existingAccounts = [] } = useQuery({
    queryKey: ['package-accounts', selectedPackageId],
    queryFn: async () => {
      if (!selectedPackageId || mode !== 'CLONE') return [];
      const result = await packageService.getAccountsByPackage(selectedPackageId, { limit: 100 });
      return result.accounts.filter((acc: any) => acc.isClone && acc.status === 'AVAILABLE');
    },
    enabled: !!selectedPackageId && mode === 'CLONE',
  });

  const packages = useMemo(
    () => allPackages.filter((p: any) => p.mode === mode),
    [allPackages, mode]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setParsedAccounts([]);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];

      const accounts = json
        .map((row) => ({
          username: row.username || row.Username || row.User || row['Tài khoản'],
          password: row.password || row.Password || row.Pass || row['Mật khẩu'],
          additionalInfo: row.additionalInfo || row['2FA'] || row.Note || row['Ghi chú'] || '',
        }))
        .filter((acc) => acc.username && acc.password);

      setParsedAccounts(accounts);
      if (accounts.length === 0) {
        toast.warning('Không tìm thấy tài khoản hợp lệ trong file (cần cột username/password)');
      } else {
        toast.success(`Đã tìm thấy ${accounts.length} tài khoản`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi đọc file Excel');
    } finally {
      setIsParsing(false);
    }
  };

  // Mutation for non-clone modes (original behavior)
  const uploadMutation = useMutation({
    mutationFn: (accounts: any[]) => accountService.bulkCreateAccounts(accounts),
    onSuccess: (data) => {
      toast.success(`Đã thêm thành công ${Array.isArray(data) ? data.length : 'các'} tài khoản`);
      resetAndClose();
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi tải lên'),
  });

  // Mutation for adding to existing clone account
  const addToCloneMutation = useMutation({
    mutationFn: ({ accountId, accounts }: { accountId: string; accounts: any[] }) =>
      accountService.addCloneAccounts(accountId, accounts),
    onSuccess: (data) => {
      toast.success(`Đã thêm ${data.addedCount} tài khoản con`);
      resetAndClose();
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi thêm tài khoản'),
  });

  // Mutation for creating new clone account
  const createCloneMutation = useMutation({
    mutationFn: ({ accountData, cloneAccounts }: { accountData: any; cloneAccounts: any[] }) =>
      accountService.createCloneAccount(accountData, cloneAccounts),
    onSuccess: () => {
      toast.success('Đã tạo tài khoản clone thành công');
      resetAndClose();
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi tạo tài khoản'),
  });

  const resetAndClose = () => {
    onOpenChange(false);
    setFile(null);
    setParsedAccounts([]);
    setSelectedPackageId('');
    setSelectedAccountId('');
    setCreateNewAccount(true);
    setNewAccountPrice(0);
    setNewAccountInfo('');
    queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
  };

  const handleUpload = () => {
    if (!selectedPackageId) {
      toast.error('Vui lòng chọn gói tài khoản');
      return;
    }
    if (parsedAccounts.length === 0) {
      toast.error('Danh sách tài khoản trống');
      return;
    }

    if (mode === 'CLONE') {
      if (createNewAccount) {
        // Create new clone account with parsed accounts as sub-accounts
        if (!newAccountPrice || newAccountPrice < 1) {
          toast.error('Vui lòng nhập giá bán');
          return;
        }
        createCloneMutation.mutate({
          accountData: {
            packageId: selectedPackageId,
            accountInfo: newAccountInfo || `Clone Account (${parsedAccounts.length} acc)`,
            price: newAccountPrice,
          },
          cloneAccounts: parsedAccounts,
        });
      } else {
        // Add to existing clone account
        if (!selectedAccountId) {
          toast.error('Vui lòng chọn tài khoản để thêm vào');
          return;
        }
        addToCloneMutation.mutate({
          accountId: selectedAccountId,
          accounts: parsedAccounts,
        });
      }
    } else {
      // Original behavior for LIST/RANDOM
      const payload = parsedAccounts.map((acc) => ({
        packageId: selectedPackageId,
        credentials: {
          username: acc.username,
          password: acc.password,
          additionalInfo: acc.additionalInfo,
        },
      }));
      uploadMutation.mutate(payload);
    }
  };

  const resetFile = () => {
    setFile(null);
    setParsedAccounts([]);
  };

  const isPending = uploadMutation.isPending || addToCloneMutation.isPending || createCloneMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tải tài khoản từ Excel ({mode})</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Selection */}
          <div className="space-y-2">
            <Label>
              Chọn Gói tài khoản <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedPackageId} onValueChange={(val) => {
              setSelectedPackageId(val);
              setSelectedAccountId('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn gói..." />
              </SelectTrigger>
              <SelectContent>
                {packages.map((p: any) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clone Mode: Choose to add to existing or create new */}
          {mode === 'CLONE' && selectedPackageId && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <Label className="font-bold">Cách thêm tài khoản</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={createNewAccount ? 'default' : 'outline'}
                  onClick={() => setCreateNewAccount(true)}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Account mới
                </Button>
                <Button
                  type="button"
                  variant={!createNewAccount ? 'default' : 'outline'}
                  onClick={() => setCreateNewAccount(false)}
                  className="flex-1"
                  disabled={existingAccounts.length === 0}
                >
                  Thêm vào Account có sẵn
                </Button>
              </div>

              {createNewAccount ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Giá bán (VNĐ) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      value={newAccountPrice}
                      onChange={(e) => setNewAccountPrice(Number(e.target.value))}
                      placeholder="VD: 10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả (tùy chọn)</Label>
                    <Input
                      value={newAccountInfo}
                      onChange={(e) => setNewAccountInfo(e.target.value)}
                      placeholder="VD: Clone Full Tướng"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <Label>Chọn Account để thêm vào</Label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Chọn account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {existingAccounts.map((acc: any) => (
                        <SelectItem key={acc._id} value={acc._id}>
                          {acc.code} - {acc.accountInfo} ({acc.quantity || 0} acc)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {existingAccounts.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Không có account nào trong gói này. Hãy tạo mới.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* File Upload Area */}
          {!file ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <FileUp className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click chọn file hoặc kéo thả file Excel vào đây</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ .xlsx, .xls (Cột: username, password, [additionalInfo])
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isParsing ? 'Đang đọc...' : `${parsedAccounts.length} tài khoản hợp lệ`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={resetFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Preview Table */}
              {parsedAccounts.length > 0 && (
                <div className="border rounded-md max-h-[200px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Info</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedAccounts.slice(0, 5).map((acc, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{acc.username}</TableCell>
                          <TableCell>******</TableCell>
                          <TableCell>{acc.additionalInfo}</TableCell>
                        </TableRow>
                      ))}
                      {parsedAccounts.length > 5 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-xs text-muted-foreground"
                          >
                            ... và {parsedAccounts.length - 5} tài khoản khác ...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedPackageId || parsedAccounts.length === 0 || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tải lên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
