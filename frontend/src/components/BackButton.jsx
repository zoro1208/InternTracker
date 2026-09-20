import { useNavigate } from "react-router-dom";

const BackButton = ({ fallback = "/" }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <span className="text-base">←</span>
            <span>Back</span>
        </button>
    );
};

export default BackButton;