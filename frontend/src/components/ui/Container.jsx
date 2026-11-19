import React from 'react';
import { cx } from '../../utils/cx';
import styles from './Container.module.css';

const Container = ({ as: Component = 'div', size = 'default', className, children, ...rest }) => (
  <Component className={cx(styles.container, styles[size], className)} {...rest}>
    {children}
  </Component>
);

export default Container;
