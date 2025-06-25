import { useNavigate }  from "react-router";


const ErrorPage = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); 
    };

    return (
        <div className="error-page">
            <div className="error-content">
                <h1>404 - Page Not Found</h1>
                <p>Sorry, the page you are looking for does not exist.</p>
                <button onClick={handleGoBack}>Go Back</button>
            </div>
        </div>
    );

}

export default ErrorPage;