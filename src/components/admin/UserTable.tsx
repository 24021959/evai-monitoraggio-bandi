
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type UserProfile = {
  id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'client';
  is_active: boolean;
};

type UserTableProps = {
  users: UserProfile[];
  loadingUsers: boolean;
  toggleUserActive: (userId: string, isCurrentlyActive: boolean, userName: string) => Promise<void>;
};

const UserTable = ({ users, loadingUsers, toggleUserActive }: UserTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> 
          Utenti del Sistema
        </CardTitle>
        <CardDescription>
          Gestisci gli utenti della piattaforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <div className="text-center py-4">Caricamento utenti...</div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      Nessun utente trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.display_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Cliente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={user.is_active} 
                            onCheckedChange={() => toggleUserActive(user.id, user.is_active, user.display_name)}
                          />
                          <span className={user.is_active ? "text-green-600" : "text-red-600"}>
                            {user.is_active ? "Attivo" : "Disattivato"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* Qui potresti aggiungere altre azioni se necessario */}
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
