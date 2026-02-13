import { useState } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { scormWrapper } from "../../libs/scormWrapper";

export default function LatestGameGraph({
    isAnimationActive = false,
    className = [],
}: {
    isAnimationActive?: boolean;
    className?: string[];
}) {
    const [data] = useState<{ name: string; score: number }[]>(() => {
        const scormData = scormWrapper.data["cmi.suspend_data"];

        return scormData.split("@").map((score, i) => {
            return {
                name: `Partie ${i + 1}`,
                score: parseInt(score, 10),
            };
        });
    });

    return (
        <div className={className.join(" ")}>
            <LineChart style={{ width: "100%", height: "100%" }} responsive={true} data={data}>
                <XAxis dataKey='name' />
                <YAxis domain={[0, 50]} />
                <Tooltip />
                <Line
                    type='monotone'
                    dataKey='score'
                    stroke='#ff375f'
                    activeDot={{ r: 8 }}
                    isAnimationActive={isAnimationActive}
                />
            </LineChart>
        </div>
    );
}
