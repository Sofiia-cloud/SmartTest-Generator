export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container flex h-full items-center justify-between px-6">
        <p className="text-sm text-muted-foreground">
          Built by <a href="https://pythagora.ai" target="_blank" rel="noopener noreferrer" className="hover:underline">Pythagora</a>
        </p>
      </div>
    </footer>
  )
}