
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { UserCircle, Eye, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types';
import { Badge } from '@/components/ui/badge';

type UserTableProps = {
  users: UserProfile[];
  loadingUsers: boolean;
  adminClientVerified: boolean | null;
  toggleUserActive: (userId: string, isCurrentlyActive: boolean, userName: string) => Promise<void>;
  onShowDetails: (user: UserProfile) => void;
};

const UserTable = ({ 
  users, 
  loadingUsers, 
  adminClientVerified,
  toggleUserActive, 
  onShowDetails 
}: UserTableProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50">
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-blue-600" /> 
          Utenti del Sistema
        </CardTitle>
        <CardDescription>
          Gestisci gli utenti della piattaforma
          {!adminClientVerified && (
            <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
              Accesso Admin non verificato
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Caricamento utenti in corso...</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Ruolo</TableHead>
                  <TableHead className="font-semibold">Stato</TableHead>
                  <TableHead className="font-semibold text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nessun utente trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{user.display_name || "-"}</TableCell>
                      <TableCell>
                        {adminClientVerified ? (
                          <span>{user.email}</span>
                        ) : (
                          <span className="text-amber-600 italic">Verifica accesso admin</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" /> Admin
                            </span>
                          ) : 'Cliente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={user.is_active} 
                            onCheckedChange={() => toggleUserActive(user.id, user.is_active || false, user.display_name || "")}
                          />
                          <span className={user.is_active ? "text-green-600" : "text-red-600"}>
                            {user.is_active ? "Attivo" : "Disattivato"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onShowDetails(user)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" /> Dettagli
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTable;
