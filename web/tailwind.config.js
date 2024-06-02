/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontSize: {
				sm: '0.750rem',
				base: '1rem',
				xl: '1.333rem',
				'2xl': '1.777rem',
				'3xl': '2.369rem',
				'4xl': '3.158rem',
				'5xl': '4.210rem'
			},
			fontFamily: {
				heading: 'Noto Sans Elymaic',
				body: 'Imprima'
			},
			fontWeight: {
				normal: '400',
				bold: '700'
			},
			colors: {
				text: {
					50: '#efeff6',
					100: '#dfdfec',
					200: '#bebeda',
					300: '#9e9ec7',
					400: '#7d7db5',
					500: '#5d5da2',
					600: '#4a4a82',
					700: '#383861',
					800: '#252541',
					900: '#131320',
					950: '#090910'
				},
				background: {
					50: '#ebebfa',
					100: '#d6d6f5',
					200: '#adadeb',
					300: '#8585e0',
					400: '#5c5cd6',
					500: '#3333cc',
					600: '#2929a3',
					700: '#1f1f7a',
					800: '#141452',
					900: '#0a0a29',
					950: '#050514'
				},
				primary: {
					50: '#ececf9',
					100: '#d9d8f3',
					200: '#b2b1e7',
					300: '#8c8bda',
					400: '#6664ce',
					500: '#3f3dc2',
					600: '#33319b',
					700: '#262574',
					800: '#19184e',
					900: '#0d0c27',
					950: '#060613'
				},
				secondary: {
					50: '#fce8f7',
					100: '#fad1ee',
					200: '#f4a4dd',
					300: '#ef76cd',
					400: '#ea48bc',
					500: '#e41bab',
					600: '#b71589',
					700: '#891067',
					800: '#5b0b44',
					900: '#2e0522',
					950: '#170311'
				},
				accent: {
					50: '#e7ffe6',
					100: '#d0ffcc',
					200: '#a0fe9a',
					300: '#71fe67',
					400: '#41fe34',
					500: '#12fe01',
					600: '#0ecb01',
					700: '#0b9801',
					800: '#076501',
					900: '#043300',
					950: '#021900'
				}
			}
		}
	},
	plugins: []
};
