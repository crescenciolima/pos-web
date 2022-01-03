import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/global.css'
import { AppProps } from 'next/app'
import { Container } from "inversify";
import TYPES from "../di/types";
import { Repository } from '../repositories/repository';
import { FirebaseRepository } from '../repositories/firebase/firebase.repository';
import { CourseServiceInterface } from '../lib/course.service.interface';
import { CourseService } from '../lib/course.service';

const container = new Container();

export default function App({ Component, pageProps }: AppProps) {
  configDependencies();
  return (
    <Component {...pageProps} />
  );
}

export function configDependencies() {
  container.bind<CourseServiceInterface>(TYPES.CourseServiceInterface).to(CourseService);
  container.bind<Repository>(TYPES.Repository).to(FirebaseRepository);
}