import React from "react";

const TxtInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  id,
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      id={id}
      {...props}
    />
  );
};

export default TxtInput;
