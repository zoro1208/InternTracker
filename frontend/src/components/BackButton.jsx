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
        <button type="button" onClick={handleBack}>
            ← Back
        </button>
    );
};

export default BackButton;