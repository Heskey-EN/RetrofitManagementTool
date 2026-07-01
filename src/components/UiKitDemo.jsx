import React from 'react'
import { Home, Wrench, ArrowUpRight } from 'lucide-react'

// Toolkit smoke-test: confirms Tailwind v4 utilities, daisyUI 5 components
// (card / btn / badge), and lucide-react icons all render.
// Reach it at #/uikit — not linked from the app; safe to delete when done.
export default function UiKitDemo() {
  return (
    <div className="bg-base-200 min-h-screen flex items-center justify-center p-8">
      <div className="dsy-card w-96 bg-base-100 shadow-xl">
        <div className="dsy-card-body">
          <div className="flex items-center gap-2">
            <Wrench className="size-5" />
            <h2 className="dsy-card-title">Retrofit toolkit</h2>
            <span className="dsy-badge dsy-badge-success dsy-badge-sm ml-auto">v4 + daisyUI 5</span>
          </div>
          <p className="text-base-content/70">
            Tailwind CSS, daisyUI components (prefixed <code>dsy-</code>), and Lucide icons are
            wired in. Use <code>dsy-btn</code>, <code>dsy-card</code>, <code>dsy-navbar</code>,
            etc. — they won't collide with the app's own <code>.btn</code>/<code>.card</code>.
          </p>
          <div className="dsy-card-actions justify-end mt-2">
            <button className="dsy-btn dsy-btn-ghost">
              <Home className="size-4" /> Home
            </button>
            <button className="dsy-btn dsy-btn-primary">
              Get started <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
