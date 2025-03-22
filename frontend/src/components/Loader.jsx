import { motion } from "framer-motion";
import PropTypes from "prop-types";

function Loader({ size = 12, color = "rose-500" }) {
  const spinVariants = {
    animate: {
      rotate: 360,
      transition: { repeat: Infinity, duration: 1, ease: "linear" },
    },
  };

  return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        className={`w-${size} h-${size} border-4 border-${color} border-t-transparent rounded-full`}
        variants={spinVariants}
        animate="animate"
      />
    </div>
  );
}

Loader.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

export default Loader;
