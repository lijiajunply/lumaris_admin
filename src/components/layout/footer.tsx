export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-center px-4 lg:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Lumaris. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
