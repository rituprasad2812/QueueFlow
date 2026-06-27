import { motion } from "framer-motion";

const FadeIn = ({
  children,
  direction = "up",
  delay = 0,
  className = "",
}) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;