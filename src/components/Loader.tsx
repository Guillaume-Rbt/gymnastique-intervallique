export default function Loader({ size }: { size: number }) {

    const space = size / 3
    const width = size * 3 + space * 2

    return <div className="loader">
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={size * 2} viewBox={`0 0 ${width} ${size * 2}`}>
            <circle cx={size / 2} cy={size + .5 * size} r={size / 2} fill="currentColor"><animate begin="0" attributeName="cy" values={`${size + .5 * size};${size / 2};${size + .5 * size}`} dur='1.5s' repeatCount='indefinite'></animate></circle>
            <circle cx={size / 2 + size + space} cy={size + .5 * size} r={size / 2} fill="currentColor"><animate begin=".375s" attributeName="cy" values={`${size + .5 * size};${size / 2};${size + .5 * size}`} dur='2s' repeatCount='indefinite'></animate></circle>
            <circle cx={size / 2 + (size + space) * 2} cy={size + .5 * size} r={size / 2} fill="currentColor"><animate begin=".75s" attributeName="cy" values={`${size + .5 * size};${size / 2};${size + .5 * size}`} dur='2s' repeatCount='indefinite'></animate></circle>
        </svg>
    </div >
}