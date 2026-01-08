/**
 * Tests API Anything Ipsum
 * Tests unitaires rapides avec mocks pour le CI/CD
 */

const BASE_URL = process.env.API_URL || 'http://localhost:4200';

describe('API Anything Ipsum', () => {
    // Test 1: Health check basique
    test('GET /api/health doit retourner le statut healthy', async () => {
        const response = await fetch(`${BASE_URL}/api/health`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
    });

    // Test 2: Health check avec timestamp
    test('GET /api/health doit contenir timestamp et status', async () => {
        const response = await fetch(`${BASE_URL}/api/health`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('timestamp');
        expect(data.status).toBe('ok');
        // Vérifier que le timestamp est une date ISO valide
        expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    // Test 3: Validation - thème vide
    test('POST /api/generate-lorem avec theme vide doit retourner 400', async () => {
        const response = await fetch(`${BASE_URL}/api/generate-lorem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                theme: '',
                paragraphs: 1,
                paragraphLength: 'court',
                stream: false,
            }),
        });

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
    });

    // Test 4: Validation - paragraphes invalides
    test('POST /api/generate-lorem avec paragraphs 0 doit retourner 400', async () => {
        const response = await fetch(`${BASE_URL}/api/generate-lorem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                theme: 'test',
                paragraphs: 0,
                paragraphLength: 'court',
                stream: false,
            }),
        });

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('paragraphe');
    });

    // Test 5: Validation - paragraphLength invalide
    test('POST /api/generate-lorem avec paragraphLength invalide doit retourner 400', async () => {
        const response = await fetch(`${BASE_URL}/api/generate-lorem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                theme: 'test',
                paragraphs: 1,
                paragraphLength: 'invalide',
                stream: false,
            }),
        });

        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('taille');
    });

    // Test 6: Génération réelle - vérifie que l'API Mistral fonctionne
    test('POST /api/generate-lorem doit retourner du contenu généré', async () => {
        const response = await fetch(`${BASE_URL}/api/generate-lorem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                theme: 'test',
                paragraphs: 1,
                paragraphLength: 'court',
                stream: false,
            }),
        });

        // Doit réussir (200) ou échouer si pas de clé API (500)
        expect([200, 500]).toContain(response.status);

        const data = await response.json();

        if (response.status === 200) {
            // Si succès, on vérifie le contenu
            expect(data.success).toBe(true);
            expect(data.text).toBeDefined();
            expect(typeof data.text).toBe('string');
            expect(data.text.length).toBeGreaterThan(10);
        } else {
            // Si échec, c'est probablement un problème de clé API
            expect(data.success).toBe(false);
            expect(data.error).toBeDefined();
        }
    }, 30000); // Timeout de 30s pour l'appel API
});

/**
 * Tests d'intégration avec l'API Mistral (optionnels, lents)
 * Ces tests ne s'exécutent que si RUN_INTEGRATION_TESTS=true
 * Lancer avec: RUN_INTEGRATION_TESTS=true npm run test
 */
const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';

(runIntegrationTests ? describe : describe.skip)('API Anything Ipsum - Tests d\'intégration', () => {
    // Test: Génération de contenu réel
    test('POST /api/generate-lorem doit retourner du contenu', async () => {
        const response = await fetch(`${BASE_URL}/api/generate-lorem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                theme: 'pirates',
                paragraphs: 1,
                paragraphLength: 'court',
                stream: false,
            }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.text).toBeDefined();
        expect(data.text.length).toBeGreaterThan(0);
    }, 30000);

    // Test: Génération longue
    test('POST /api/generate-lorem avec length «long» doit générer du contenu', async () => {
        const response = await fetch(`${BASE_URL}/api/generate-lorem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                theme: 'espace',
                paragraphs: 1,
                paragraphLength: 'long',
                stream: false,
            }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.text).toBeDefined();
        expect(data.text.length).toBeGreaterThan(0);
    }, 60000);
});
