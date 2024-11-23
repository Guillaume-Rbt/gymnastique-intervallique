import { Children } from "react"

export default function Card({ children }) {
    return <div className="card">
        {children}
    </div>
}