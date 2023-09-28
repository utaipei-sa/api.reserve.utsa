import { template } from 'template.js';
import { EmailBlock } from 'signin_email.js';

export default function app() {
    return template(
        'Sign In or Sign Up', 
        <EmailBlock />
    );
}