// TestimonialCarousel.tsx
import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import styles from '../../styles/Testinomials.module.css';
import testimonialsData from './testimonials.json';

type Testimonial = {
  id: number;
  image: string;
  name: string;
  testimonial: string;
};

const TestimonialCarousel: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    setTestimonials(testimonialsData);
  }, []);

  return (
    <div className={styles.testimonialCarouselContainer}>
      <h1>Testimonials</h1>
      <Carousel controls={false} indicators={true} fade interval={3000} pause={false}>
        {testimonials.map((testimonial) => (
          <Carousel.Item key={testimonial.id}>
            <div className="d-flex justify-content-center">
              <div className={styles.testimonialItem}>
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className={`${styles.testimonialImage} rounded-circle mb-3`}
                />
                <h3>{testimonial.name}</h3>
                <p className={styles.testimonialText}>{testimonial.testimonial}</p>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default TestimonialCarousel;
