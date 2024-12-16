import React from "react";

const InputField = ({ type, value, onChange, id, placeholder, label }) => {
  return (
    <div className="form-outline mb-4">
      <input
        type={type}
        value={value}
        onChange={onChange}
        id={id}
        className="form-control form-control-lg"
        placeholder={placeholder}
      />
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default InputField;
