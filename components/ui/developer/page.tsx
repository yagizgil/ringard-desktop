import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Key, Server, Users, Activity, Plus, RefreshCw, Globe, Settings, Layout, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DeveloperPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-[300px] h-full bg-[var(--surface)] shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Geliştirici Portalı</h2>
          <p className="text-sm text-[var(--text-secondary)]">Uygulama ve botlarınızı yönetin</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-3 py-2">
            <div className="mb-6">
              <h3 className="px-4 mb-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Genel</h3>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  <Layout className="mr-3 h-4 w-4 opacity-70" />
                  Genel Bakış
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start rounded-lg bg-[var(--surface-hover)] text-[var(--text-primary)]"
                >
                  <Bot className="mr-3 h-4 w-4 opacity-70" />
                  Botlar
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  <Shield className="mr-3 h-4 w-4 opacity-70" />
                  OAuth Uygulamaları
                </Button>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="px-4 mb-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Ayarlar</h3>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  <Settings className="mr-3 h-4 w-4 opacity-70" />
                  Genel Ayarlar
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto bg-[var(--background)]">
        <ScrollArea className="h-full">
          <div className="container p-8 max-w-6xl mx-auto">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3 mb-10">
              <Card className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-secondary)] shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--text-primary)]">Toplam Bot</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                    <Bot className="h-4 w-4 text-[var(--text-primary)]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">12</div>
                  <p className="text-xs text-[var(--text-secondary)]">+2 son 30 günde</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-secondary)] shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--text-primary)]">Aktif Kullanıcılar</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                    <Users className="h-4 w-4 text-[var(--text-primary)]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">2,405</div>
                  <p className="text-xs text-[var(--text-secondary)]">+180 son 7 günde</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-secondary)] shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--text-primary)]">API İstekleri</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                    <Activity className="h-4 w-4 text-[var(--text-primary)]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">582,195</div>
                  <p className="text-xs text-[var(--text-secondary)]">+23% son 24 saatte</p>
                </CardContent>
              </Card>
            </div>

            {/* Bots Section */}
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Botlar</h2>
                  <p className="text-[var(--text-secondary)]">Bot listesi ve yönetimi</p>
                </div>
                <Button className="bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Bot Oluştur
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-secondary)] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--surface)]">
                          <AvatarImage src="/bot-avatar.png" />
                          <AvatarFallback>RB</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[var(--success)] ring-2 ring-[var(--surface)]"></div>
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-[var(--text-primary)]">Ringard Bot</CardTitle>
                        <span className="text-xs text-[var(--text-secondary)]">Son güncelleme: 5dk önce</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-[var(--text-secondary)]">
                          <Server className="w-4 h-4 mr-1 opacity-70" />
                          Sunucular
                        </div>
                        <p className="text-xl font-semibold text-[var(--text-primary)]">10</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-[var(--text-secondary)]">
                          <Users className="w-4 h-4 mr-1 opacity-70" />
                          Kullanıcılar
                        </div>
                        <p className="text-xl font-semibold text-[var(--text-primary)]">2,405</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-[var(--text-secondary)]">
                          <Activity className="w-4 h-4 mr-1 opacity-70" />
                          İstekler
                        </div>
                        <p className="text-xl font-semibold text-[var(--text-primary)]">582K</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[var(--text-secondary)]">Bot ID</Label>
                        <div className="flex space-x-2">
                          <Input 
                            value="12345678901234567" 
                            readOnly 
                            className="font-mono text-sm bg-[var(--surface)] border-0 shadow-inner text-[var(--text-primary)]" 
                          />
                          <Button size="icon" className="shrink-0 bg-[var(--surface)] border-0 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] shadow-lg">
                            <Key className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[var(--text-secondary)]">Bot Token</Label>
                        <div className="flex space-x-2">
                          <Input 
                            type="password" 
                            value="••••••••••••••••" 
                            readOnly 
                            className="font-mono text-sm bg-[var(--surface)] border-0 shadow-inner text-[var(--text-primary)]" 
                          />
                          <Button size="icon" className="shrink-0 bg-[var(--surface)] border-0 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] shadow-lg">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
