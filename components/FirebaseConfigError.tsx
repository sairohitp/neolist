import React from 'react';

export const FirebaseConfigError: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 border-t-4 border-red-500 dark:bg-slate-800 dark:border-red-600">
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">Final Configuration Step</h1>
                    <p className="text-lg text-slate-700 mt-2 dark:text-slate-300">
                        Your app needs to be securely connected to your Firebase backend.
                    </p>
                </header>
                <div className="text-left bg-slate-50 p-6 border border-slate-200 rounded-lg text-sm space-y-6 dark:bg-slate-800/50 dark:border-slate-700">
                    <div>
                        <p className="font-semibold mb-3 text-base text-slate-800 dark:text-slate-100">Step 1: Add Your Firebase Config</p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
                            <li>
                                Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-400">Firebase Console</a> and select your project.
                            </li>
                            <li>
                                Click the <strong>Gear icon (⚙️)</strong> {'>'} <strong>Project settings</strong>.
                            </li>
                            <li>
                                In the "Your apps" card, find your Web App.
                            </li>
                            <li>
                                Under "SDK setup and configuration", select <strong>Config</strong>.
                            </li>
                            <li>
                                Copy the entire <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded dark:bg-slate-700 dark:text-slate-200">firebaseConfig</code> object.
                            </li>
                            <li>
                                Open <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded dark:bg-slate-700 dark:text-slate-200">services/firebase.ts</code> and paste it, replacing the placeholder.
                            </li>
                        </ol>
                    </div>

                    <div className="border-t border-dashed border-slate-300 pt-6 dark:border-slate-600">
                        <p className="font-semibold mb-3 text-base text-red-700 dark:text-red-500">Step 2: Authorize The Preview Domain (CRITICAL)</p>
                         <p className="mb-3 text-slate-600 dark:text-slate-400">For security, Firebase only allows sign-ins from approved websites. You must approve the domain for this preview environment.</p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
                            <li>
                                In the Firebase Console, go to the <strong>Authentication</strong> section.
                            </li>
                            <li>
                                Click on the <strong>Settings</strong> tab, then <strong>Authorized domains</strong>.
                            </li>
                             <li>
                                Click <strong>Add domain</strong>.
                            </li>
                            <li>
                                Look at your browser's URL bar. Copy the domain part (e.g., <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded dark:bg-slate-700 dark:text-slate-200">unique-id.preview.app.google.dev</code>) and paste it into the box.
                            </li>
                            <li>
                                Click <strong>Add</strong>.
                            </li>
                        </ol>
                    </div>
                </div>
                <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
                    After completing both steps, please refresh this page.
                </p>
            </div>
        </div>
    );
};
