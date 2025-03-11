import React from 'react';
import PropTypes from 'prop-types';

export default function StrandContainer({ name, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 m-4 max-w-sm">
      <h2 className="text-xl font-bold mb-2 text-gray-800">{name}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

StrandContainer.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
};

StrandContainer.defaultProps = {
  name: "Unknown",
  description: "No description available",
};
