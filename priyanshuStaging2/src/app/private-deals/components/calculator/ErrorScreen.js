import './Showintrest.css';
export default function ErrorScreen({ onRetry }) {
    return (
       <div className="errorContainer">
        <img src={'/sierror.svg'}/>
    <h3>We couldn’t complete your PAN verification</h3>
    <div className='errorResponsible'>
      <p>This could be due to:</p>
        <ul>
      <li>Incorrect or mismatched PAN/Aadhaar details</li>
      <li>Digilocker timeout or network issue</li>
      <li>Incomplete consent/authorization</li>
      <li>Temporary server issue</li>
    </ul>
    </div>

    <button
     className="btn btn-warning  w-100 fw-bold rounded-pill"
      onClick={onRetry}
    >
      Verify Again
    </button>
  </div>
    )
}   