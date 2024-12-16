import React from "react";

const Checkbox = ({ id, label }) => {
  return (
    <div className="form-check mb-0">
      <input className="form-check-input me-2" type="checkbox" id={id} />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
