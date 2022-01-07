import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/global.css'
import { AppProps } from 'next/app'
import TYPES from "../di/types";
import { Repository } from '../repositories/repository';
import { FirebaseRepository } from '../repositories/firebase/firebase.repository';
import { CourseServiceInterface } from '../lib/course.service.interface';
import { CourseService } from '../lib/course.service';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  );
}