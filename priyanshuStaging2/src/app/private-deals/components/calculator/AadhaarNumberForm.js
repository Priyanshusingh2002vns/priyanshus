export default function AadhaarNumberForm({ aadhaarNumber, setAadhaarNumber, onSubmit }) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h5 className="mb-4">Enter your Aadhaar Number</h5>
        <div className="form-group mb-3">
          <label htmlFor="aadhaarNumber" className="form-label">
            Aadhaar Number
          </label>
          <input
            type="text"
            className="form-control"
            id="aadhaarNumber"
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value)}
            maxLength={12}
            pattern="\d{12}"
            required
          />
        </div>
        <button type="submit" className="proceed-btn btn btn-warning text-white w-100 rounded-pill">
          Verify Aadhaar
        </button>
      </form>
    );
}   