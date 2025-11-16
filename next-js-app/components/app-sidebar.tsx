"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/useTheme"
import { Plus, Puzzle, SunIcon, MoonIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button";

export function AppSidebar() {

    const { theme, toggleTheme } = useTheme();
    const { state } = useSidebar();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className={`flex items-center ${state === "collapsed" ? "justify-center px-2" : "gap-3 px-3"} py-3`}>
                    {/* Logo icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-purple-500 via-brand-purple-400 to-brand-purple-300 text-zinc-950 shadow-lg shadow-brand-purple-500/20">
                        <span className="text-sm font-bold tracking-tight">
                            A
                        </span>
                    </div>

                    {/* Brand text - hidden when collapsed */}
                    {state !== "collapsed" && (
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-sm font-semibold tracking-tight truncate text-brand-purple-400">
                                ALGONOVA
                            </h1>
                            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                                DSA · C++ · WebAssembly
                            </p>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-brand-purple-400/80 font-medium">
                        Algorithms
                    </SidebarGroupLabel>
                    <SidebarGroupContent>

                        <SidebarMenu>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive className="bg-brand-purple-500/10 text-brand-purple-400 hover:bg-brand-purple-500/20 hover:text-brand-purple-300 border-l-2 border-brand-purple-500">
                                    <Link href="/">
                                        <Puzzle className="mr-2 h-4 w-4 text-brand-purple-400" />
                                        <span>Sudoku Solver</span>
                                        <span className="ml-auto text-[0.65rem] rounded-full border border-brand-purple-500/50 bg-brand-purple-500/20 px-1.5 py-0.5 text-brand-purple-400 font-medium">
                                            C++
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton disabled className="text-zinc-500 hover:text-zinc-400">
                                    <Plus className="mr-2 h-4 w-4 text-zinc-500" />
                                    <span>Coming soon…</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>


            <SidebarFooter>
                <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
                    {state !== "collapsed" && (
                        <span className="mr-2">
                            Built with <span className="font-medium bg-gradient-to-r from-brand-purple-400 to-brand-purple-300 bg-clip-text text-transparent">Emscripten . WASM</span>
                        </span>
                    )}

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleTheme} 
                        className={`${state === "collapsed" ? "w-full" : ""} hover:bg-brand-purple-500/10 hover:text-brand-purple-400 text-zinc-400 transition-colors`}
                    >
                        {theme == "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}