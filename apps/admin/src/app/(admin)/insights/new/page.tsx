import { InsightForm } from '../_components/InsightForm';

export default function NewInsightPage() {
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Insight</h1>
            <div className="bg-white p-8 border rounded-xl shadow-sm">
                <InsightForm />
            </div>
        </div>
    );
}
