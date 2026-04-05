import DirectorShell from "@/components/director/DirectorShell";

export default function DirectorLayout({ children }: { children: React.ReactNode }) {
  return <DirectorShell>{children}</DirectorShell>;
}
