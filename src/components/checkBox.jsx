export default function ({ label, checked = true, onChange = () => { } }) {
    return <label>
        <input checked={checked} onChange={onChange} type="checkbox" /> <span>{label}</span>
    </label>
}