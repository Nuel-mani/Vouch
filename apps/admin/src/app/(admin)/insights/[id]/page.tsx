import { getInsight } from '../../../actions/insights';
import { InsightForm } from '../_components/InsightForm';

export default async function EditInsightPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { data: insight } = await getInsight(id);

    if (!insight) {
        return <div>Insight not found</div>;
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Insight</h1>
            <div className="bg-white p-8 border rounded-xl shadow-sm">
                <InsightForm initialData={insight} />
            </div>
        </div>
    );
}
